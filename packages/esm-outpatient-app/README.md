# Service Queues

The `Service Queue` app is a package that provides capabilities to track a patient's progress as they move through a clinic. Users can see an overview of various clinic metrics such as:

- The number of active visits.
- The number of patients waiting for a particular service.
- The average number of minutes spent by patients waiting for a service.

The key component of the service queue app is the Active Visits table. This shows a tabular overview of the active visits ongoing in a facility and the wait time of patients. Users can add patients to the service queue by starting visits for them. They can also view information from the current active visits as well as the previous visit on each queue entry by clicking the table extension slot. Users can also change the priority and status of an entry in the queue from the UI, effectively moving a patient from one point in the queue to another. In order to indicate that a patient is currently attending service, click on the bell icon. In order to edit an entry, click the pencil icon. 

In order to start using the module, configure the following concepts in the config :
`priorityConceptSetUuid` eg priority 
`defaultPriorityConceptUuid` eg not urgent
`serviceConceptSetUuid` eg service
`statusConceptSetUuid` eg status
`defaultStatusConceptUuid` eg waiting
`emergencyPriorityConcept` eg emergency

After configuring the concepts, add the services according to the facility setup using the `Add new service` button.

In order to configure rooms that provide different services, click the `Add new room` button. To view patients attending service in different rooms, click the `Queue screen` button.

You will now be able to use the service queue module.
