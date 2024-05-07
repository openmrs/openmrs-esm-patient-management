export const generateFormatting = (order: Array<string>, separator: string) => {
  const parse = (value: string) => {
    const parts = value.split(separator);
    const date = new Date(null);

    order.forEach((key, index) => {
      switch (key) {
        case 'd':
          date.setDate(parseInt(parts[index]));
          break;
        case 'm':
          date.setMonth(parseInt(parts[index]) - 1);
          break;
        case 'Y':
          date.setFullYear(parseInt(parts[index]));
          break;
      }
    });
    return date;
  };

  const format = (date: Date) => {
    if (date === null) {
      return '';
    } else if (!(date instanceof Date)) {
      return date;
    } else {
      const parts = [];

      order.forEach((key, index) => {
        switch (key) {
          case 'd':
            parts[index] = date.getDate();
            break;
          case 'm':
            parts[index] = date.getMonth() + 1;
            break;
          case 'Y':
            parts[index] = date.getFullYear();
            break;
        }
      });

      return parts.join(separator);
    }
  };

  const placeHolder = order.map((x) => (x === 'Y' ? 'YYYY' : x + x)).join(separator);
  const dateFormat = order.join(separator).replace('YYYY', 'yyyy');

  return { parse, format, placeHolder, dateFormat };
};
