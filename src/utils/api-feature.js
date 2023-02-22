export default class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    let searchFields = { ...this.queryString };
    const excludedFields = ["page", "limit", "sort", "order", "q"];
    const operatorRegex = /(.*)_((lt)|(gt)|(gte)|(lte))$/;

    excludedFields.forEach((key) => delete searchFields[key]);
    Object.entries(searchFields).forEach(([key, value]) => {
      const matchOperator = key.match(operatorRegex);
      if (matchOperator) {
        const field = matchOperator[1];
        const operator = `$${matchOperator[2]}`;
        searchFields[field] = { ...searchFields[field], [operator]: value };
        delete searchFields[key];
      }
    });
    if (this.queryString.q) {
      searchFields = {
        ...searchFields,
        $text: { $search: this.queryString.q },
      };
    }
    this.query = this.query.find(searchFields);
    return this;
  }

  sort() {
    const { sort = "id", order = "asc" } = this.queryString;
    this.query = this.query.sort({ [sort]: order });
    return this;
  }

  paginate() {
    const { page = 1, limit = 10 } = this.queryString;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
