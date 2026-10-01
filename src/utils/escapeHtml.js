import Handlebars from "handlebars";

const escapeHtml = (value) => Handlebars.Utils.escapeExpression(value);

export default escapeHtml;
