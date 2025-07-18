# #!/usr/bin/env bash -eu

# # get the dir containing the script
# script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# # create a temporary working directory
# working_dir=$(mktemp -d "${TMPDIR:-/tmp/}openmrs-e2e-frontends.XXXXXXXXXX")
# # get a list of all the apps in this workspace
# apps=$(yarn workspaces list --json | jq -r 'if (.location | test("-app$")) and (.location | test("patient-list") | not) then .name else empty end')
# # this array will hold all of the packed app names
# app_names=()

# echo "Creating packed archives of apps..."
# # for each app
# for app in $apps
# do
#   # @openmrs/esm-whatever -> _openmrs_esm_whatever
#   app_name=$(echo "$app" | tr '[:punct:]' '_');
#   # add to our array
#   app_names+=("$app_name.tgz");
#   # run yarn pack for our app and add it to the working directory
#   yarn workspace "$app" pack -o "$working_dir/$app_name.tgz" >/dev/null;
# done;
# echo "Created packed app archives"

# echo "Creating dynamic spa-assemble-config.json..."
# # dynamically assemble our list of frontend modules, prepending the login app and
# # primary navigation apps; apps will all be in the /app directory of the Docker
# # container
# jq -n \
#   --arg apps "$apps" \
#   --arg app_names "$(echo ${app_names[@]})" \
#   '{
#     "@openmrs/esm-primary-navigation-app": "next",
#     "@openmrs/esm-home-app": "next",
#     "@openmrs/esm-patient-chart-app": "next",
#     "@openmrs/esm-patient-banner-app": "next",
#     "@openmrs/esm-form-engine-app": "next
#   } + (
#     ($apps | split("\n")) as $apps | ($app_names | split(" ") | map("/app/" + .)) as $app_files
#     | [$apps, $app_files]
#     | transpose
#     | map({"key": .[0], "value": .[1]})
#     | from_entries
#   )' | jq '{"frontendModules": .}' > "$working_dir/spa-assemble-config.json"
# echo "Created dynamic spa-assemble-config.json"

# echo "Copying Docker configuration..."
# cp "$script_dir/Dockerfile" "$working_dir/Dockerfile"
# cp "$script_dir/docker-compose.yml" "$working_dir/docker-compose.yml"

# cd $working_dir
# echo "Starting Docker containers..."
# # CACHE_BUST to ensure the assemble step is always run
# docker compose build --build-arg CACHE_BUST=$(date +%s) frontend
# docker compose up -d


#!/usr/bin/env bash -eu

script_dir=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
working_dir=$(mktemp -d "${TMPDIR:-/tmp/}openmrs-e2e-frontends.XXXXXXXXXX")

# Get apps and verify
apps=$(yarn workspaces list --json | jq -r 'select(.location | test("-app$")) | select(.location | test("patient-list") | not) | .name')
if [ -z "$apps" ]; then
  echo "Error: No apps found!"
  exit 1
fi

echo "Found apps:"
echo "$apps"

# Pack apps
app_names=()
echo "Creating packed archives of apps..."
for app in $apps; do
  app_name=$(echo "$app" | tr '[:punct:]' '_').tgz
  app_names+=("$app_name")
  yarn workspace "$app" pack -o "$working_dir/$app_name" >/dev/null
  echo "Packed: $app -> $app_name"
done

# Generate config
echo "Creating dynamic spa-assemble-config.json..."
config_file="$working_dir/spa-assemble-config.json"

# Create base config
cat > "$config_file" <<EOF
{
  "frontendModules": {
    "@openmrs/esm-primary-navigation-app": "next",
    "@openmrs/esm-home-app": "next",
    "@openmrs/esm-patient-chart-app": "next",
    "@openmrs/esm-patient-banner-app": "next"
EOF

# Add dynamic modules
for i in "${!app_names[@]}"; do
  app=$(echo "$apps" | sed -n "$((i+1))p")
  echo "    ,\"$app\": \"/app/${app_names[$i]}\"" >> "$config_file"
done

# Close config
cat >> "$config_file" <<EOF
  }
}
EOF

# Verify JSON
if ! jq empty "$config_file" >/dev/null 2>&1; then
  echo "Error: Invalid JSON generated in config file!"
  echo "Config file content:"
  cat "$config_file"
  exit 1
fi

echo "Generated config:"
jq . "$config_file"

# Copy Docker files
echo "Copying Docker configuration..."
cp "$script_dir/Dockerfile" "$working_dir/Dockerfile"
cp "$script_dir/docker-compose.yml" "$working_dir/docker-compose.yml"

# Build and start
cd "$working_dir"
echo "Starting Docker containers..."
docker compose build --no-cache --build-arg CACHE_BUST=$(date +%s) frontend
docker compose up -d
