define(['handlebars'], function(Handlebars) {

this["Ubi"] = this["Ubi"] || {};
this["Ubi"]["Templates"] = this["Ubi"]["Templates"] || {};

this["Ubi"]["Templates"]["sample-precompiled-partial"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"entry\">\n  <h1>";
  if (stack1 = helpers.title) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h1>\n  <div class=\"body\">\n    ";
  if (stack1 = helpers.body) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.body; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n  </div>\n</div>";
  return buffer;
  });

this["Ubi"]["Templates"]["search-results"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n        <li>\n            <a href=\"";
  if (stack1 = helpers.PageURL) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.PageURL; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"search-catalog-item ";
  options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data};
  stack2 = ((stack1 = helpers.ifeq || depth0.ifeq),stack1 ? stack1.call(depth0, depth0.Type, "SearchPromo", options) : helperMissing.call(depth0, "ifeq", depth0.Type, "SearchPromo", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                <img src=\"/assets/images/spinner.gif\" title=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.SearchThumbnailImage),stack1 == null || stack1 === false ? stack1 : stack1.Alt)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" alt=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.SearchThumbnailImage),stack1 == null || stack1 === false ? stack1 : stack1.Alt)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-src-mobile=\""
    + escapeExpression(((stack1 = ((stack1 = depth0.SearchThumbnailImage),stack1 == null || stack1 === false ? stack1 : stack1.Mobile)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" class=\"lazy-image\">\n                <div>\n                    <h2>";
  if (stack2 = helpers.DisplayName) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.DisplayName; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  buffer += escapeExpression(stack2)
    + "</h2>\n                    <dl class=\"clearfix\">\n                        ";
  if (stack2 = helpers.PlatformText) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.PlatformText; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                        ";
  if (stack2 = helpers.DateText) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = depth0.DateText; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </dl>\n                    <ul class=\"platforms\">\n                        ";
  options = {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data};
  if (stack2 = helpers.PlatformCategory) { stack2 = stack2.call(depth0, options); }
  else { stack2 = depth0.PlatformCategory; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2; }
  if (!helpers.PlatformCategory) { stack2 = blockHelperMissing.call(depth0, stack2, options); }
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </ul>\n                </div>\n            </a>\n        </li>\n    ";
  return buffer;
  }
function program2(depth0,data) {
  
  
  return "search-promo";
  }

function program4(depth0,data) {
  
  var buffer = "";
  buffer += "\n                        <li><span aria-hidden=\"true\" class=\"icon-"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"></span></li>\n                        ";
  return buffer;
  }

  buffer += "<div class=\"search-tray-result-meta-data\">\n    <em>";
  if (stack1 = helpers.TotalRecords) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.TotalRecords; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " Results:</em> <span class=\"search-tray-breadcrumb\">Featured</span>\n</div>\n<div class=\"search-tray-sort\">\n    <em>Sort by:</em> <a href=\"#\" class=\"sort-by-date\">Date</a> | <a href=\"#\" class=\"sort-by-alpha\">A-Z</a>\n</div>\n<ul class=\"clearfix animatable-list\">\n    ";
  stack2 = ((stack1 = ((stack1 = ((stack1 = depth0.SearchResult),stack1 == null || stack1 === false ? stack1 : stack1.Items)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1)),blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n</ul>\n";
  return buffer;
  });

return this["Ubi"]["Templates"];

});