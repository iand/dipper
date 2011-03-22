
var Moriarty = { };

Moriarty.SimpleGraph = function() {
 this._index = {};
  this._ns_rev = {};
  for (var prefix in this._ns) {
    this._ns_rev[this._ns[prefix]] = prefix;
  }

}

Moriarty.SimpleGraph.prototype = {
  _ns : {
    'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs' : 'http://www.w3.org/2000/01/rdf-schema#',
    'cs' : 'http://purl.org/vocab/changeset/schema#',
    'bf' : 'http://schemas.talis.com/2006/bigfoot/configuration#',
    'frm' : 'http://schemas.talis.com/2006/frame/schema#',

    'dc' : 'http://purl.org/dc/elements/1.1/',
    'dct' : 'http://purl.org/dc/terms/',
    'dctype' : 'http://purl.org/dc/dcmitype/',

    'geo' : 'http://www.w3.org/2003/01/geo/wgs84_pos#',
    'rel' : 'http://purl.org/vocab/relationship/',
    'wn' : 'http://xmlns.com/wordnet/1.6/',
    'air' : 'http://www.daml.org/2001/10/html/airport-ont#',
    'contact' : 'http://www.w3.org/2000/10/swap/pim/contact#',
    'frbr' : 'http://purl.org/vocab/frbr/core#',

    'ad' : 'http://schemas.talis.com/2005/address/schema#',
    'lib' : 'http://schemas.talis.com/2005/library/schema#',
    'dir' : 'http://schemas.talis.com/2005/dir/schema#',
    'user' : 'http://schemas.talis.com/2005/user/schema#',
    'sv' : 'http://schemas.talis.com/2005/service/schema#',
    'mo' : 'http://purl.org/ontology/mo/',
    'status' : 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
    'label' : 'http://purl.org/net/vocab/2004/03/label#',
    'skos' : 'http://www.w3.org/2004/02/skos/core#',
    'bibo' : 'http://purl.org/ontology/bibo/',
    'ov' : 'http://open.vocab.org/terms/',
    'void' : 'http://rdfs.org/ns/void#',
    'xsd' : 'http://www.w3.org/2001/XMLSchema#',
    'cc' : 'http://creativecommons.org/ns#'
    ,'os':'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#'
    ,'dbpedia':'http://dbpedia.org/resource/'
    ,'dbo':'http://dbpedia.org/ontology/'
    ,'gn':'http://www.geonames.org/ontology#'
    ,'dimb':'http://musicbrainz.dataincubator.org/schema/'
  },

  add_resource_triple : function(s, p, o) {
    if (! this.has_resource_triple(s, p, o) ) {
      var o_type = o.indexOf('_:') == 0 ? 'bnode' : 'uri';
      var o_info = { "type" : o_type , "value" : o };
      this._add_triple(s, p, o_info);
    }
  },


  add_literal_triple : function(s, p, o, l, dt) {
    if (! this.has_literal_triple(s, p, o, l, dt) ) {
      var o_info = { "type" : 'literal' , "value" : o };
      if ( arguments.length > 4 ) {
        o_info['datatype'] = arguments[4];
      }
      else if ( arguments.length > 3 ) {
        o_info['lang'] = arguments[3];
      }
      this._add_triple(s, p, o_info);
    }
  }

  ,get_index : function() {
    return this._index;
  }

  ,dump_to_console : function() {
    for (s in this._index) {
      var s_str = s;
      if (s.indexOf('_:') != 0) {
        s_str = '<' + s_str + '>';
      }
      if (this._index.hasOwnProperty(s)) {
        for (p in this._index[s]) {
          if (this._index[s].hasOwnProperty(p)) {
            for (var i = 0; i < this._index[s][p].length; i++) {
              if (this._index[s][p][i]['type'] == 'uri') {
                console.log(s_str + ' <' + p + '> <' + this._index[s][p][i]['value'] + '>');
              }
              else if (this._index[s][p][i]['type'] == 'bnode') {
                console.log(s_str + ' <' + p + '> ' + this._index[s][p][i]['value']);
              }
              else if (this._index[s][p][i]['type'] == 'literal') {
                console.log(s_str + ' <' + p + '> "' + this._index[s][p][i]['value'] + '"');
              }
              else {
                console.log("Unknown value type for " + s_str + ' <' + p + '> index ' + i);
              }
            }
          }
        }
      }
    }
  }


  ,get_first_literal : function(s, p, def) {
    if ( arguments.length < 3 ) def = '';
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return def;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'literal') {
        return this._index[s][p][i]['value'];
      }
    }
    return def;
  },

  remove_resource_triple : function(s, p, o) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'uri' && this._index[s][p][i]['value'] == o ) {
        if ( this._index[s][p].length <=1 ) {
          this.remove_property_values(s, p);
        }
        else {
          this._index[s][p].splice(i, 1);
        }

        return;
      }
    }
  },

  remove_triples_about : function(s) {
    if (! this._index.hasOwnProperty(s) ) return;
    delete this._index[s];
  },

  remove_property_values : function(s, p) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    delete this._index[s][p];

    var prop_count = 0;
    for (prop in this._index[s]) prop_count++;
    if ( prop_count == 0) {
      delete this._index[s];
    }

  },

  remove_all_triples : function() {
    this._index = {};
  },

  is_empty : function() {
    var subj_count = 0;
    for (subj in this._index) return false;
    return true;
  },


  has_resource_triple : function(s, p, o) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    var o_type = o.indexOf('_:') == 0 ? 'bnode' : 'uri';
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == o_type && this._index[s][p][i]['value'] == o ) return true;
    }
    return false;
  },

  has_literal_triple : function(s, p, o, l, dt) {
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return false;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] == 'literal' && this._index[s][p][i]['value'] == o ) {
        if ( this._index[s][p][i].hasOwnProperty('lang') ) {
          if ( arguments.length > 3 && this._index[s][p][i]['lang'] == l ) {
            return true;
          }
        }
        else if ( this._index[s][p][i].hasOwnProperty('datatype') ) {
          if ( arguments.length > 4 && this._index[s][p][i]['datatype'] == dt ) {
            return true;
          }
        }
        else {
          return true;
        }
      }
    }
    return false;
  },

  get_first_resource : function(s, p, def) {
    if ( arguments.length < 3 ) def = '';
    if (! this._index.hasOwnProperty(s) || ! this._index[s].hasOwnProperty(p)) return def;
    for (var i = 0; i < this._index[s][p].length; i++) {
      if ( this._index[s][p][i]['type'] != 'literal') {
        return this._index[s][p][i]['value'];
      }
    }
    return def;
  },

  has_triple_about : function(s) {
    return this._index.hasOwnProperty(s);
  },

  from_json : function(data) {
    if ( arguments.length < 2 ) base = '';
    if (typeof data === "string") {
      this._index = JSON.parse(data);
    }
    else  {
      this._index = data;
    }
  },


  _add_triple : function(s, p, o_info) {
    if (! this._index.hasOwnProperty(s)) {
      this._index[s] = {};
      this._index[s][p] = new Array();
    }
    else if (! this._index[s].hasOwnProperty(p)) {
      this._index[s][p] = new Array();
    }

    this._index[s][p].push(o_info);
  },

  subject_exists : function(s) {
    return this._index.hasOwnProperty(s);
  },

  properties : function(s) {
    props = [];

    if (this.subject_exists(s)) {
      for (prop in this._index[s]) {
        if (this._index[s].hasOwnProperty(prop)) {
          props.push(prop);
        }
      }
    }
    return props;
  },

  subjects : function() {
    subs = [];

    for (s in this._index) {
      if (this._index.hasOwnProperty(s)) {
        subs.push(s);
      }
    }

    return subs;
  },

  values : function(s,p) {
    values = [];

    if (this.subject_exists(s)) {
      if (this._index[s].hasOwnProperty(p)) {
        for (var i = 0; i < this._index[s][p].length; i++) {
          values.push(this._index[s][p][i]);
        }
      }
    }
    return values;
  },

  get_label : function(resource_uri) {
    var label_properties = [
      'http://www.w3.org/2004/02/skos/core#prefLabel',
      ,'http://purl.org/dc/terms/title'
      ,'http://purl.org/dc/elements/1.1/title'
      ,'http://www.w3.org/2000/01/rdf-schema#label'
      ,'http://purl.org/rss/1.0/title'
      ,'http://xmlns.com/foaf/0.1/name'
      ,'http://rdfs.org/sioc/ns#name'
      ,'http://www.w3.org/1999/02/22-rdf-syntax-ns#value'
      ,'http://www.w3.org/2006/vcard/ns#label'
      , 'http://www.geonames.org/ontology#name'
      , 'http://education.data.gov.uk/ontology/school#establishmentName'
    ];

    for (var i = 0; i < label_properties.length; i++) {
      var text = this.get_first_literal(resource_uri,label_properties[i], '', 'en');
      if (text) return text;
    }

    return resource_uri;
  },


  get_description : function(resource_uri) {
    var descriptive_properties = [
      'http://purl.org/dc/terms/description',
      'http://purl.org/dc/elements/1.1/description',
      'http://www.w3.org/2000/01/rdf-schema#comment',
      'http://purl.org/rss/1.0/description',
      'http://vocab.org/bio/0.1/olb',
      'http://purl.org/ontology/po/short_synopsis',
    ];

    for (var i = 0; i < descriptive_properties.length; i++) {
      var text = this.get_first_literal(resource_uri,descriptive_properties[i], '', 'en');
      if (text) return text;
    }

    return '';
  },

  qname : function(uri) {
    store_re = /^http:\/\/api\.talis\.com\/stores\/([^\/]+)\/items\/([^\#]+)\#self$/;

    uri_re = /^(.*[\/\#])([a-z0-9\-\_]+)$/i;
    if (m = store_re.exec(uri)) {
      return m[1] + ':' + m[2];
    }
    else if (m = uri_re.exec(uri)) {
      ns = m[1];
      localname = m[2];
      prefix = this.get_prefix('' + ns);
      if (prefix) {
        return prefix + ':' + localname;
      }
    }
    return undefined;
  },

  get_prefix : function(ns) {
    if (this._ns_rev.hasOwnProperty(ns)) {
      return this._ns_rev[ns];
    }
    else {

      if (ns.slice(ns.length-1) == '#') {
        ns = ns.slice(0, ns.length - 1);
      }
      slash_pos = ns.lastIndexOf('/');
      while (slash_pos != -1) {
        candidate = ns.slice(slash_pos + 1);
        if (candidate.search(/^[a-zA-Z][a-zA-Z0-9\-]*$/) != -1 && candidate.length > 1 && !this._ns.hasOwnProperty(candidate) && candidate != 'schema' && candidate != 'ontology' && candidate != 'vocab' && candidate != 'terms' && candidate != 'ns' && candidate != 'core') {
          return candidate.toLowerCase();
        }
        ns = ns.slice(0, slash_pos);
        slash_pos = ns.lastIndexOf('/');

      }
    }
    return undefined;
  }

}

if (!this.JSON) {
    JSON = {};
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// If the object has a dontEnum length property, we'll treat it as an array.

            if (typeof value.length === 'number' &&
                    !value.propertyIsEnumerable('length')) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (var i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (var i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (var i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
})();



Moriarty.Store = function(uri, proxy_prefix) {
  uri = String(uri);
  if (uri.slice(-1) == '/') {
    this._uri = uri.slice(0, uri.length-1);
  }
  else  {
    this._uri = uri;
  }
  this._proxy_prefix = proxy_prefix;
}

Moriarty.Store.prototype = {
  describe : function(about, fn) {
    request_uri = this._uri + "/meta?output=json&about=" + escape(about);
    this._request(request_uri,fn);
  },

  backlinks : function(about, fn) {
    sparql_query = 'select ?p ?r where {?r ?p <' + about + '>.}';
    request_uri = this._uri + "/services/sparql?output=json&query=" + escape(sparql_query);
    this._request(request_uri, fn);
  },

  _request : function(uri, fn) {
    if (this._proxy_prefix) request_uri = this._proxy_prefix  + escape(request_uri);
    return $.getJSON(request_uri, fn);
  }



}



Moriarty.WidgetEngine = function(desc, labels) {
  this.labels = labels;
  if (typeof desc === "object") {
    this._desc = desc;
  }
  else {
    this._desc = new Moriarty.SimpleGraph();
    this._desc.from_json(desc);
  }


this.property_clusters = [

  { 'name': '',
    'id': 'pdefault',
    'class': '',
    'properties': [
       'http://www.w3.org/2004/02/skos/core#prefLabel'
      ,'http://www.w3.org/2000/01/rdf-schema#label'
      ,'http://purl.org/dc/terms/title'
      ,'http://purl.org/dc/elements/1.1/title'
      ,'http://xmlns.com/foaf/0.1/name'
      ,'http://www.geonames.org/ontology#name'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasOfficialName'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasName'
      ,'http://www.w3.org/2006/vcard/ns#label'
      ,'http://www.w3.org/2004/02/skos/core#definition'
      ,'http://www.w3.org/2004/02/skos/core#scopeNote'
      ,'http://www.w3.org/2006/03/wn/wn20/schema/gloss'
      ,'http://open.vocab.org/terms/subtitle'
      ,'http://purl.org/ontology/po/medium_synopsis'
      ,'http://www.w3.org/2000/01/rdf-schema#comment'
      ,'http://purl.org/dc/terms/abstract'
      ,'http://dbpedia.org/ontology/abstract'
      ,'http://purl.org/dc/terms/description'
      ,'http://purl.org/dc/elements/1.1/description'
      ,'http://open.vocab.org/terms/firstSentence'
      ,'http://purl.org/stuff/rev#text'
      ,'http://purl.org/dc/terms/creator'
      ,'http://purl.org/dc/elements/1.1/creator'
      ,'http://purl.org/dc/terms/contributor'
      ,'http://purl.org/dc/elements/1.1/contributor'
      ,'http://xmlns.com/foaf/0.1/depiction'
      ,'http://xmlns.com/foaf/0.1/img'
      ,'http://xmlns.com/foaf/0.1/logo'
    ] }

  ,{ 'name': 'Biograhical Information',
    'id': 'pbio',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/title',
      'http://xmlns.com/foaf/0.1/givenname',
      'http://xmlns.com/foaf/0.1/firstName',
      'http://xmlns.com/foaf/0.1/surname',
      'http://purl.org/vocab/bio/0.1/olb',
      'http://purl.org/vocab/bio/0.1/event',
      'http://purl.org/vocab/relationship/childOf',
      'http://purl.org/vocab/relationship/parentOf',
      'http://purl.org/vocab/relationship/ancestorOf',
      'http://purl.org/vocab/relationship/descendantOf',
      'http://purl.org/vocab/relationship/grandchildOf',
      'http://purl.org/vocab/relationship/grandparentOf',
      'http://purl.org/vocab/relationship/lifePartnerOf',
      'http://purl.org/vocab/relationship/siblingOf',
      'http://purl.org/vocab/relationship/spouseOf'
    ] }

  ,{ 'name': 'Contact Details',
    'id': 'pcontact',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/phone'
      ,'http://www.w3.org/2006/vcard/ns#tel'
      ,'http://www.w3.org/2006/vcard/ns#fax'
      ,'http://xmlns.com/foaf/0.1/mbox'
      ,'http://rdfs.org/sioc/ns#email'
      ,'http://xmlns.com/foaf/0.1/icqChatID'
      ,'http://xmlns.com/foaf/0.1/msnChatID'
      ,'http://xmlns.com/foaf/0.1/aimChatID'
      ,'http://xmlns.com/foaf/0.1/jabberID'
      ,'http://xmlns.com/foaf/0.1/yahooChatID'
    ] }

  ,{ 'name': 'Aliases and Alternate Names',
    'id': 'paliases',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/nick',
      ,'http://www.w3.org/2004/02/skos/core#altLabel'
      ,'http://purl.org/net/schemas/space/alternateName'
      ,'http://www.geonames.org/ontology#alternateName'
      ,'http://purl.org/ontology/bibo/shortTitle'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasVernacularName'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasBoundaryLineName'
    ] }

  ,{ 'name': 'Employment',
    'id': 'pemployment',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/workplaceHomepage',
      'http://purl.org/vocab/relationship/employedBy',
      'http://purl.org/vocab/relationship/employerOf',
      'http://purl.org/vocab/relationship/worksWith'
    ] }

  ,{ 'name': 'Leadership',
    'id': 'pleadership',
    'class': '',
    'properties': [
       'http://dbpedia.org/property/leaderName'
    ] }




  ,{ 'name': 'Education',
    'id': 'peducation',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/schoolHomepage'
    ] }

  ,{ 'name': 'Location',
    'id': 'pgeo',
    'class': '',
    'properties': [
       'http://open.vocab.org/terms/regionalContextMap'
      ,'http://open.vocab.org/terms/nationalContextMap'
      ,'http://www.w3.org/2006/vcard/ns#street-address'
      ,'http://schemas.talis.com/2005/address/schema#streetAddress'
      ,'http://www.w3.org/2006/vcard/ns#locality'
      ,'http://schemas.talis.com/2005/address/schema#localityName'
      ,'http://www.w3.org/2006/vcard/ns#region'
      ,'http://schemas.talis.com/2005/address/schema#regionName'
      ,'http://www.w3.org/2006/vcard/ns#postal-code'
      ,'http://schemas.talis.com/2005/address/schema#postalCode'
      ,'http://www.gazettes-online.co.uk/ontology/location#hasAddress'
      ,'http://www.w3.org/2003/01/geo/wgs84_pos#lat'
      ,'http://www.w3.org/2003/01/geo/wgs84_pos#long'
      ,'http://www.w3.org/2003/01/geo/wgs84_pos#lat_long'
      ,'http://www.w3.org/2003/01/geo/wgs84_pos#altitude'
      ,'http://www.georss.org/georss/point'
      ,'http://dbpedia.org/ontology/elevation'
      ,'http://xmlns.com/foaf/0.1/based_near'
      ,'http://www.w3.org/2003/01/geo/wgs84_pos#location'
      ,'http://www.w3.org/2000/10/swap/pim/contact#nearestAirport'
      ,'http://purl.org/net/schemas/space/country'
      ,'http://purl.org/net/schemas/space/place'
      ,'http://purl.org/vocab/bio/0.1/place'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#borders'
      ,'http://www.geonames.org/ontology#inCountry'
      ,'http://www.geonames.org/ontology#parentFeature'
      ,'http://www.geonames.org/ontology#nearbyFeatures'
      ,'http://www.geonames.org/ontology#locationMap'
    ] }



  ,{ 'name': 'Subjects and Classifications',
    'id': 'psubjects',
    'class': '',
    'properties': [
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
      ,'http://purl.org/dc/terms/subject'
      ,'http://purl.org/dc/elements/1.1/subject'
      ,'http://www.w3.org/2004/02/skos/core#subject'
      ,'http://purl.org/ontology/po/genre'
      ,'http://olrdf.appspot.com/key/dewey_decimal_class'
      ,'http://olrdf.appspot.com/key/lc_classification'
      ,'http://purl.org/dc/terms/LCC'
      ,'http://xmlns.com/foaf/0.1/topic'
      ,'http://rdfs.org/sioc/ns#topic'
      ,'http://www.w3.org/2004/02/skos/core#broader'
      ,'http://www.w3.org/2004/02/skos/core#narrower'
      ,'http://www.w3.org/2004/02/skos/core#closeMatch'
      ,'http://purl.org/ontology/po/format'
      ,'http://schemas.talis.com/2006/recordstore/schema#tags'
      ,'http://www.geonames.org/ontology#featureClass'
    ] }


  ,{ 'name': 'Publication Facts',
    'id': 'ppublication',
    'class': '',
    'properties': [
      'http://purl.org/ontology/bibo/edition'
      ,'http://purl.org/dc/terms/publisher'
      ,'http://purl.org/dc/elements/1.1/publisher'
      ,'http://rdvocab.info/Elements/placeOfPublication'
      ,'http://olrdf.appspot.com/key/publish_country'
      ,'http://purl.org/dc/terms/issued'
      ,'http://www.gazettes-online.co.uk/ontology#hasPublicationDate'
    ] }

  ,{ 'name': 'Citation',
    'id': 'pcitation',
    'class': '',
    'properties': [
      'http://purl.org/dc/terms/isPartOf'
      ,'http://purl.org/ontology/bibo/volume'
      ,'http://purl.org/ontology/bibo/issue'
      ,'http://purl.org/ontology/bibo/pageStart'
      ,'http://purl.org/ontology/bibo/pageEnd'
      ,'http://www.gazettes-online.co.uk/ontology#hasIssueNumber'
      ,'http://www.gazettes-online.co.uk/ontology#hasEdition'
    ] }



   ,{ 'name': 'Dataset',
    'id': 'pdataset',
    'class': '',
    'properties': [
      'http://rdfs.org/ns/void#exampleResource',
      'http://rdfs.org/ns/void#sparqlEndpoint',
      'http://rdfs.org/ns/void#uriLookupEndpoint',
      'http://rdfs.org/ns/void#subset',
      'http://rdfs.org/ns/void#vocabulary',
      'http://rdfs.org/ns/void#uriRegexPattern'
    ] }

  ,{ 'name': 'Physical Dimensions',
    'id': 'pformat',
    'class': '',
    'properties': [
      'http://purl.org/dc/terms/medium'
      ,'http://open.vocab.org/terms/numberOfPages'
      ,'http://olrdf.appspot.com/key/pagination'
      ,'http://olrdf.appspot.com/key/physical_dimensions'
      ,'http://open.vocab.org/terms/weight'
      ,'http://purl.org/net/schemas/space/mass'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasArea'

    ] }

  ,{ 'name': 'Further Information',
    'id': 'pfurther',
    'class': '',
    'properties': [
      'http://xmlns.com/foaf/0.1/homepage'
      ,'http://xmlns.com/foaf/0.1/page'
      ,'http://xmlns.com/foaf/0.1/weblog'
      ,'http://purl.org/ontology/po/microsite'
      ,'http://purl.org/ontology/mo/wikipedia'
      ,'http://www.geonames.org/ontology#wikipediaArticle'
      ,'http://rdfs.org/sioc/ns#feed'
      ,'http://www.w3.org/2000/01/rdf-schema#seeAlso'
      ,'http://www.w3.org/2002/07/owl#sameAs'
      ,'http://xmlns.com/foaf/0.1/isPrimaryTopicOf'
    ] }

  ,{ 'name': 'Members',
    'id': 'pmembers',
    'class': '',
    'properties': [
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_1',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_2',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_3',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_4',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_5',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_6',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_7',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_8',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_9',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_10',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_11',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_12',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_13',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_14',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_15',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_16',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_17',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_18',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_19',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_20',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_21',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_22',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_23',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_24',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_25',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_26',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_27',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_28',
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#_29'
    ] }



  ,{ 'name': 'Identifers',
    'id': 'pidentifiers',
    'class': '',
    'properties': [
       'http://purl.org/dc/terms/identifier'
      ,'http://purl.org/dc/elements/1.1/identifier'
      ,'http://purl.org/ontology/bibo/isbn10'
      ,'http://purl.org/ontology/bibo/isbn13'
      ,'http://purl.org/ontology/bibo/lccn'
      ,'http://purl.org/ontology/bibo/oclcnum'
      ,'http://purl.org/ontology/bibo/doi'
      ,'http://purl.org/ontology/bibo/uri'
      ,'http://purl.org/ontology/bibo/issn'
      ,'http://purl.org/ontology/bibo/eissn'
      ,'http://xmlns.com/foaf/0.1/mbox_sha1sum'
      ,'http://xmlns.com/foaf/0.1/openid'
      ,'http://purl.org/net/schemas/space/internationalDesignator'
      ,'http://www.daml.org/2001/10/html/airport-ont#icao'
      ,'http://www.daml.org/2001/10/html/airport-ont#iata'
      ,'http://rdfs.org/sioc/ns#id'
      ,'http://purl.org/vocab/aiiso/schema#code'
      ,'http://dbpedia.org/property/iata'
      ,'http://dbpedia.org/property/icao'
      ,'http://www.ordnancesurvey.co.uk/ontology/AdministrativeGeography/v2.0/AdministrativeGeography.rdf#hasCensusCode'
      ,'http://schemas.talis.com/2005/dir/schema#etag'
      ,'http://www.geonames.org/ontology#featureCode'
    ] }

  ,{ 'name': 'Provenance',
    'id': 'pprovenance',
    'class': '',
    'properties': [
       'http://purl.org/dc/terms/created',
      ,'http://purl.org/dc/terms/modified'
      ,'http://purl.org/dc/terms/source'
      ,'http://purl.org/dc/elements/1.1/source'
      ,'http://purl.org/dc/terms/coverage'
      ,'http://purl.org/dc/elements/1.1/coverage'
      ,'http://www.w3.org/2004/02/skos/core#inScheme'
    ] }


  ,{ 'name': 'Legal Information',
    'id': 'plegal',
    'class': '',
    'properties': [
       'http://purl.org/dc/terms/rights'
      ,'http://purl.org/dc/elements/1.1/rights'
      ,'http://purl.org/dc/terms/license'
      ,'http://creativecommons.org/ns#license'
    ] }

];













}

Moriarty.WidgetEngine.prototype = {
  render : function(resource_info, inline, brief) {
    inline = inline || false;
    brief = brief || false;
    var w = new Moriarty.Widget(this._desc, this);
    if (brief) {
      return w.render_brief(resource_info, inline);
    }
    return w.render( resource_info, inline, brief);
  }


};

Moriarty.Widget = function( desc, engine) {
  this._engine = engine;


  if (typeof desc === "object") {
    this._desc = desc;
  }
  else {
    this._desc = new Moriarty.SimpleGraph();
    this._desc.from_json(desc);
  }



}

Moriarty.Widget.prototype = {
  render : function(resource_info, inline, brief) {
    if (resource_info['type'] == 'literal') return this.render_literal(resource_info, inline);
    inline = inline || false;
    brief = brief || false;
    if (brief) return this.render_brief(resource_info, inline);

    h = '';
    var properties = this._desc.properties(resource_info['value']);
    for (var i = 0; i < this._engine.property_clusters.length; i++) {
      if (properties.length == 0) break;

      var cluster = this._engine.property_clusters[i];
      var props = this.intersect(cluster['properties'], properties);
      if (props.length > 0) {
        properties = this.diff(properties, props);
        h += '<div id="' + this.henc(cluster['id']) + '" class="' + this.henc(cluster['class']) + '"><fieldset class="' + this.henc(cluster['class']) + '">';
        if ( cluster['name'] ) {
          h += '<legend>' + this.henc(cluster['name']) + '</legend>';
        }

        h += this.format_property_value_list(resource_info, props, false);

        h += '</fieldset></div>';
      }
    }

    if (properties.length > 0) {
      h += '<div id="pother" class="' + this.henc(this._engine.property_clusters[0]['class']) + '"><fieldset class="' + this.henc(this._engine.property_clusters[0]['class']) + '">';
      h += '<legend>Other Facts</legend>';
      h += this.format_property_value_list(resource_info, properties);
      h += '</fieldset></div>';
    }
    return h;

  },


  in_array: function(array, value) {
    value = value || 0;

    for (var i = 0, len = array.length; i < len; ++i) {
      if (array[i] == value) {
        return true;
      }
    }

    return false;
  },


  diff: function(array1, array2) {
    var result = [];

    for (var i = 0, len = array1.length; i < len; ++i) {
      if (!this.in_array(array2, array1[i])) {
        result.push(array1[i]);
      }
    }

    return result;
  },

  intersect: function(array1, array2) {
    var result = [];

    for (var i = 0, len = array1.length; i < len; ++i) {
      if (this.in_array(array2, array1[i])) {
        result.push(array1[i]);
      }
    }

    return result;
  },

  render_brief : function(resource_info, inline) {
    inline = inline || false;
    if (resource_info['type'] == 'literal') return this.render_literal(resource_info, inline);
    h = '<div class="res">' + this.link_uri(resource_info['value']);
    h += '</div>';
    return h;
  },

  render_literal : function(resource_info, inline, brief) {
    inline = inline || false;
    brief = brief || false;
    h = '<div class="lit">';

    value = resource_info['value'];
    encode_value = true;
    if (resource_info.hasOwnProperty('datatype')) {
      if (resource_info['datatype'] == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral') {
        encode_value = false;
      }
    }

    if (encode_value) {
      h += this.henc(value);
    }
    else {
      h += value;
    }

    if (resource_info.hasOwnProperty('lang')) {
      h += ' <span class="lang">[' + this.henc(resource_info['lang']) + ']</span>';
    }
    if (resource_info.hasOwnProperty('datatype')) {
      h += ' <span class="dt">[' + this.link_uri(resource_info['datatype']) + ']</span>';
    }
    h += '</div>';
    return h;
  },

  ucfirst : function(t) {
    if (t.length == 0) return;
    return t.slice(0,1).toUpperCase() + t.slice(1,t.length);
  },

  format_property_value_list : function(resource_info, properties, inverse) {
    inverse = inverse || false;

    h = '<table width="100%">';
    cl = 'odd';
    for (var i = 0; i < properties.length; i++) {
      var label;
      values = this._desc.values(resource_info['value'], properties[i]);
      if (inverse) {
        label = this.ucfirst(this._engine.labels.get_first_literal(properties[i], 'http://purl.org/net/vocab/2004/03/label#inverseSingular'));
        if (! label) {
          label = this._desc.qname(properties[i]);
          if (!label) {
            label = properties[i];
          }
          label = 'Is ' + label + ' of';
        }
      }
      else {
        if (values.length > 1) {
          label = this.ucfirst(this._engine.labels.get_first_literal(properties[i], 'http://purl.org/net/vocab/2004/03/label#plural'));
        }
        else  {
          label = this.ucfirst(this._engine.labels.get_first_literal(properties[i], 'http://www.w3.org/2000/01/rdf-schema#label'));
        }

      }
      h += '<tr><th width="20%" valign="top" class="' + cl + '" style="vertical-align: top"><span title="'  + this.henc(properties[i]) + '">'  + this.link_uri(properties[i],label)  + '</span></th>';
      h += '<td width="80%" valign="top" class="value ' + cl + '" style="vertical-align: top">';

      if (properties[i] == 'http://dbpedia.org/property/wikilink'
          || properties[i] == 'http://dbpedia.org/property/redirect'
          || properties[i] == 'http://dbpedia.org/property/disambiguates'
          || properties[i] == 'http://dbpedia.org/property/relatedInstance') {
        h += values.length + ' values';
      }
      else {
        h += this.format_values(properties[i], values);
      }

      h += '</td>';
      h += '</tr>';
      cl = cl == 'odd' ? 'even' : 'odd';
    }
    h +='</table>';
    return h;
  },



  format_values : function(property, values) {
    results = [];
    var upper = values.length;
    for (var i = 0; i < upper; i++) {
      if (values[i]['type'] == 'uri' && (property == 'http://xmlns.com/foaf/0.1/depiction' || property =='http://xmlns.com/foaf/0.1/img' || property =='http://xmlns.com/foaf/0.1/logo'
          || property == 'http://open.vocab.org/terms/regionalContextMap'
          || property == 'http://open.vocab.org/terms/nationalContextMap'
          )) {
        results.push('<img src="'  + this.henc(values[i]['value']) + '" class="thumb" title="'  + this.henc(values[i]['value']) + '" />' );
      }
      else {
        results.push(this._engine.render(values[i], false, true));
      }
    }
    results.sort();
    if (upper < values.length) {
      results.push('<div>Another ' + (values.length - upper) + ' values not shown.</div>');
    }
    return results.join("\n");
  },

  get_label : function(uri) {
    label = this._desc.get_label(uri);
    if (label == uri) {
      label = this._engine.labels.get_label(uri);
    }
    return label;
  },

  henc : function(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },

  link_uri : function(uri, label) {
    label = label || '';

    if (uri.indexOf('_:') == 0) {
      if (label == '') {
        label = this.get_label(uri);
      }
      return label;
    }
    else if (uri.indexOf('https:') == 0 || uri.indexOf('http:') == 0)  {
      ret = '';
      labelled = true;
      if (label == '') {
        label = this.get_label(uri);
        if (label == uri) {
          labelled = false;
          qname = this._desc.qname(uri);
          if (qname) {
            label = qname;
          }
        }
      }


      ret += '<a href="' + this.henc(uri) + '" class="uri';
      if (cl) {
        ret += ' ' + cl;
      }
      if (!labelled) {
        ret += ' unlabelled';
      }
      ret += '">';
      ret += label + '</a>';
      return ret;
    }
    else {
      return this.henc(uri);
    }
  }

};

