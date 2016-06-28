

var types = {},
  TOK_TYPE_NOOP = types.TOK_TYPE_NOOP = "noop",
  TOK_TYPE_OPERAND = types.TOK_TYPE_OPERAND = "operand",
  TOK_TYPE_FUNCTION = types.TOK_TYPE_FUNCTION = "function",
  TOK_TYPE_SUBEXPR = types.TOK_TYPE_SUBEXPR = "subexpression",
  TOK_TYPE_ARGUMENT = types.TOK_TYPE_ARGUMENT = "argument",
  TOK_TYPE_OP_PRE = types.TOK_TYPE_OP_PRE = "operator-prefix",
  TOK_TYPE_OP_IN = types.TOK_TYPE_OP_IN = "operator-infix",
  TOK_TYPE_OP_POST = types.TOK_TYPE_OP_POST = "operator-postfix",
  TOK_TYPE_WSPACE = types.TOK_TYPE_WSPACE = "white-space",
  TOK_TYPE_UNKNOWN = types.TOK_TYPE_UNKNOWN = "unknown",

  TOK_SUBTYPE_START = types.TOK_SUBTYPE_START = "start",
  TOK_SUBTYPE_STOP = types.TOK_SUBTYPE_STOP = "stop",

  TOK_SUBTYPE_TEXT = types.TOK_SUBTYPE_TEXT = "text",
  TOK_SUBTYPE_NUMBER = types.TOK_SUBTYPE_NUMBER = "number",
  TOK_SUBTYPE_LOGICAL = types.TOK_SUBTYPE_LOGICAL = "logical",
  TOK_SUBTYPE_ERROR = types.TOK_SUBTYPE_ERROR = "error",
  TOK_SUBTYPE_RANGE = types.TOK_SUBTYPE_RANGE = "range",

  TOK_SUBTYPE_MATH = types.TOK_SUBTYPE_MATH = "math",
  TOK_SUBTYPE_CONCAT = types.TOK_SUBTYPE_CONCAT = "concatenate",
  TOK_SUBTYPE_INTERSECT = types.TOK_SUBTYPE_INTERSECT = "intersect",
  TOK_SUBTYPE_UNION = types.TOK_SUBTYPE_UNION = "union";

var isEu = false;

/**
 * @class
 */

function F_token(value, type, subtype) {
  this.value = value;
  this.type = type;
  this.subtype = subtype;
}

/**
 * @class
 */

function F_tokens() {

  this.items = [];

  this.add = function(value, type, subtype) {
    if (!subtype) {
      subtype = "";
    }
    var token = new F_token(value, type, subtype);
    this.addRef(token);
    return token;
  };
  this.addRef = function(token, index) {
    if(index === undefined){
      this.items.push(token);
    }else{
      this.items.splice(index, 0, token);
    }
  };
  this.insert = function(value, type, subtype, index){
    if (!subtype) {
      subtype = "";
    }
    var token = new F_token(value, type, subtype);
    this.addRef(token, index);
    return token;
  };
  this.replace = function(value, type, subtype, index){
    if (!subtype) {
      subtype = "";
    }
    var token = new F_token(value, type, subtype);
    this.items[index] = token;
  };

  this.index = -1;
  this.reset = function() {
    this.index = -1;
  };
  this.BOF = function() {
    return (this.index <= 0);
  };
  this.EOF = function() {
    return (this.index >= (this.items.length - 1));
  };
  this.moveNext = function() {
    if (this.EOF()) {
      return false;
    }
    this.index += 1;
    return true;
  };
  this.current = function() {
    if (this.index === -1) {
      return null;
    }
    return (this.items[this.index]);
  };
  this.next = function() {
    if (this.EOF()) {
      return null;
    }
    return (this.items[this.index + 1]);
  };
  this.previous = function() {
    if (this.index < 1) {
      return null;
    }
    return (this.items[this.index - 1]);
  };

}

function F_tokenStack() {

  this.items = [];

  this.push = function(token) {
    this.items.push(token);
  };
  this.pop = function(name) {
    var token = this.items.pop();
    return (new F_token(name || "", (token && token.type) || '', TOK_SUBTYPE_STOP));
  };

  this.token = function() {
    return ((this.items.length > 0) ? this.items[this.items.length - 1] : null);
  };
  this.value = function() {
    return ((this.token()) ? this.token().value.toString() : "");
  };
  this.type = function() {
    return ((this.token()) ? this.token().type.toString() : "");
  };
  this.subtype = function() {
    return ((this.token()) ? this.token().subtype.toString() : "");
  };

}

function getTokens(formula) {

  var tokens = new F_tokens(),
    tokenStack = new F_tokenStack(),

    offset = 0,

    currentChar = function() {
      return formula.substr(offset, 1);
    },
    doubleChar = function() {
      return formula.substr(offset, 2);
    },
    nextChar = function() {
      return formula.substr(offset + 1, 1);
    },
    EOF = function() {
      return (offset >= formula.length);
    },

    token = "",

    inString = false,
    inPath = false,
    inRange = false,
    inError = false,
    regexSN = /^[1-9]{1}(\.[0-9]+)?E{1}$/;

  while (formula.length > 0) {
    if (formula.substr(0, 1) === " ") {
      formula = formula.substr(1);
    } else {
      if (formula.substr(0, 1) === "=") {
        formula = formula.substr(1);
      }
      break;
    }
  }



  while (!EOF()) {

    // state-dependent character evaluation (order is important)
    // double-quoted strings
    // embeds are doubled
    // end marks token
    if (inString) {
      if (currentChar() === "\"") {
        if (nextChar() === "\"") {
          token += "\"";
          offset += 1;
        } else {
          inString = false;
          tokens.add(token, TOK_TYPE_OPERAND, TOK_SUBTYPE_TEXT);
          token = "";
        }
      } else {
        token += currentChar();
      }
      offset += 1;
      continue;
    }

    // single-quoted strings (links)
    // embeds are double
    // end does not mark a token
    if (inPath) {
      if (currentChar() === "'") {

        if (nextChar() === "'") {
          token += "'";
          offset += 1;
        } else {
          inPath = false;
          token += "'";
        }
      } else {
        token += currentChar();
      }

      offset += 1;
      continue;
    }

    // bracked strings (range offset or linked workbook name)
    // no embeds (changed to "()" by Excel)
    // end does not mark a token
    if (inRange) {
      if (currentChar() === "]") {
        inRange = false;
      }
      token += currentChar();
      offset += 1;
      continue;
    }

    // error values
    // end marks a token, determined from absolute list of values
    if (inError) {
      token += currentChar();
      offset += 1;
      if ((",#NULL!,#DIV/0!,#VALUE!,#REF!,#NAME?,#NUM!,#N/A,").indexOf("," + token + ",") !== -1) {
        inError = false;
        tokens.add(token, TOK_TYPE_OPERAND, TOK_SUBTYPE_ERROR);
        token = "";
      }
      continue;
    }

    // scientific notation check
    if (("+-").indexOf(currentChar()) !== -1) {
      if (token.length > 1) {
        if (token.match(regexSN)) {
          token += currentChar();
          offset += 1;
          continue;
        }
      }
    }

    // independent character evaulation (order not important)
    // establish state-dependent character evaluations
    if (currentChar() === "\"") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, TOK_TYPE_UNKNOWN);
        token = "";
      }
      inString = true;
      offset += 1;
      continue;
    }

    if (currentChar() === "'") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, TOK_TYPE_UNKNOWN);
        token = "";
      }
      token = "'"
      inPath = true;
      offset += 1;
      continue;
    }

    if (currentChar() === "[") {
      inRange = true;
      token += currentChar();
      offset += 1;
      continue;
    }

    if (currentChar() === "#") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, TOK_TYPE_UNKNOWN);
        token = "";
      }
      inError = true;
      token += currentChar();
      offset += 1;
      continue;
    }

    // mark start and end of arrays and array rows
    if (currentChar() === "{") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, TOK_TYPE_UNKNOWN);
        token = "";
      }
      tokenStack.push(tokens.add("ARRAY", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
      tokenStack.push(tokens.add("ARRAYROW", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
      offset += 1;
      continue;
    }

    if (currentChar() === ";") {
      if (isEu) {
        // If is EU then handle ; as list seperators
        if (token.length > 0) {
          tokens.add(token, TOK_TYPE_OPERAND);
          token = "";
        }
        if (tokenStack.type() !== TOK_TYPE_FUNCTION) {
          tokens.add(currentChar(), TOK_TYPE_OP_IN, TOK_SUBTYPE_UNION);
        } else {
          tokens.add(currentChar(), TOK_TYPE_ARGUMENT);
        }
        offset += 1;
        continue;
      } else {
        // Else if not Eu handle ; as array row seperator
        if (token.length > 0) {
          tokens.add(token, TOK_TYPE_OPERAND);
          token = "";
        }
        tokens.addRef(tokenStack.pop());
        tokens.add(",", TOK_TYPE_ARGUMENT);
        tokenStack.push(tokens.add("ARRAYROW", TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
        offset += 1;
        continue;
      }
    }

    if (currentChar() === "}") {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.addRef(tokenStack.pop("ARRAYROWSTOP"));
      tokens.addRef(tokenStack.pop("ARRAYSTOP"));
      offset += 1;
      continue;
    }

    // trim white-space
    if (currentChar() === " ") {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add("", TOK_TYPE_WSPACE);
      offset += 1;
      while ((currentChar() === " ") && (!EOF())) {
        offset += 1;
      }
      continue;
    }

    // multi-character comparators
    if ((",>=,<=,<>,").indexOf("," + doubleChar() + ",") !== -1) {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(doubleChar(), TOK_TYPE_OP_IN, TOK_SUBTYPE_LOGICAL);
      offset += 2;
      continue;
    }

    // standard infix operators
    if (("+-*/^&=><").indexOf(currentChar()) !== -1) {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(currentChar(), TOK_TYPE_OP_IN);
      offset += 1;
      continue;
    }

    // standard postfix operators
    if (("%").indexOf(currentChar()) !== -1) {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(currentChar(), TOK_TYPE_OP_POST);
      offset += 1;
      continue;
    }

    // start subexpression or function
    if (currentChar() === "(") {
      if (token.length > 0) {
        tokenStack.push(tokens.add(token, TOK_TYPE_FUNCTION, TOK_SUBTYPE_START));
        tokens.add(currentChar(), TOK_TYPE_OPERAND, TOK_SUBTYPE_TEXT);
        token = "";
      } else {
        tokenStack.push(tokens.add("", TOK_TYPE_SUBEXPR, TOK_SUBTYPE_START));
        tokens.add(currentChar(), TOK_TYPE_OPERAND, TOK_SUBTYPE_TEXT);
      }
      offset += 1;
      continue;
    }

    // function, subexpression, array parameters
    if (currentChar() === "," && !isEu) {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      if (tokenStack.type() !== TOK_TYPE_FUNCTION) {
        tokens.add(currentChar(), TOK_TYPE_OP_IN, TOK_SUBTYPE_UNION);
      } else {
        tokens.add(currentChar(), TOK_TYPE_ARGUMENT);
      }
      offset += 1;
      continue;
    }

    // stop subexpression
    if (currentChar() === ")") {
      if (token.length > 0) {
        tokens.add(token, TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(currentChar(), TOK_TYPE_OPERAND, TOK_SUBTYPE_TEXT);
      tokens.addRef(tokenStack.pop());
      offset += 1;
      continue;
    }

    // token accumulation
    token += currentChar();
    offset += 1;

  }

  // dump remaining accumulation
  if (token.length > 0) {
    tokens.add(token, TOK_TYPE_OPERAND);
  }

  // move all tokens to a new collection, excluding all unnecessary white-space tokens
  var tokens2 = new F_tokens();

  while (tokens.moveNext()) {

    token = tokens.current();

    if (token.type.toString() === TOK_TYPE_WSPACE) {
      var doAddToken = (tokens.BOF()) || (tokens.EOF());
      //if ((tokens.BOF()) || (tokens.EOF())) {}
      doAddToken = doAddToken && tokens.previous() && (((tokens.previous().type.toString() === TOK_TYPE_FUNCTION) && (tokens.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || ((tokens.previous().type.toString() === TOK_TYPE_SUBEXPR) && (tokens.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || (tokens.previous().type.toString() === TOK_TYPE_OPERAND));
      //else if (!(
      //       ((tokens.previous().type === TOK_TYPE_FUNCTION) && (tokens.previous().subtype == TOK_SUBTYPE_STOP))
      //    || ((tokens.previous().type == TOK_TYPE_SUBEXPR) && (tokens.previous().subtype == TOK_SUBTYPE_STOP))
      //    || (tokens.previous().type == TOK_TYPE_OPERAND)))
      //  {}
      doAddToken = doAddToken && tokens.next() && (((tokens.next().type.toString() === TOK_TYPE_FUNCTION) && (tokens.next().subtype.toString() === TOK_SUBTYPE_START)) || ((tokens.next().type.toString() === TOK_TYPE_SUBEXPR) && (tokens.next().subtype.toString() === TOK_SUBTYPE_START)) || (tokens.next().type.toString() === TOK_TYPE_OPERAND));
      //else if (!(
      // ((tokens.next().type == TOK_TYPE_FUNCTION) && (tokens.next().subtype == TOK_SUBTYPE_START))
      // || ((tokens.next().type == TOK_TYPE_SUBEXPR) && (tokens.next().subtype == TOK_SUBTYPE_START))
      // || (tokens.next().type == TOK_TYPE_OPERAND)))
      // {}
      //else { tokens2.add(token.value, TOK_TYPE_OP_IN, TOK_SUBTYPE_INTERSECT)};
      if (doAddToken) {
        tokens2.add(token.value.toString(), TOK_TYPE_OP_IN, TOK_SUBTYPE_INTERSECT);
      }
      continue;
    }

    tokens2.addRef(token);

  }

  // switch infix "-" operator to prefix when appropriate, switch infix "+" operator to noop when appropriate, identify operand
  // and infix-operator subtypes, pull "@" from in front of function names
  while (tokens2.moveNext()) {

    token = tokens2.current();

    if ((token.type.toString() === TOK_TYPE_OP_IN) && (token.value.toString() === "-")) {
      if (tokens2.BOF()) {
        token.type = TOK_TYPE_OP_PRE.toString();
      } else if (((tokens2.previous().type.toString() === TOK_TYPE_FUNCTION) && (tokens2.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || ((tokens2.previous().type.toString() === TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || (tokens2.previous().type.toString() === TOK_TYPE_OP_POST) || (tokens2.previous().type.toString() === TOK_TYPE_OPERAND)) {
        token.subtype = TOK_SUBTYPE_MATH.toString();
      } else {
        token.type = TOK_TYPE_OP_PRE.toString();
      }
      continue;
    }

    if ((token.type.toString() === TOK_TYPE_OP_IN) && (token.value.toString() === "+")) {
      if (tokens2.BOF()) {
        token.type = TOK_TYPE_NOOP.toString();
      } else if (((tokens2.previous().type.toString() === TOK_TYPE_FUNCTION) && (tokens2.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || ((tokens2.previous().type.toString() === TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype.toString() === TOK_SUBTYPE_STOP)) || (tokens2.previous().type.toString() === TOK_TYPE_OP_POST) || (tokens2.previous().type.toString() === TOK_TYPE_OPERAND)) {
        token.subtype = TOK_SUBTYPE_MATH.toString();
      } else {
        token.type = TOK_TYPE_NOOP.toString();
      }
      continue;
    }

    if ((token.type.toString() === TOK_TYPE_OP_IN) && (token.subtype.length === 0)) {
      if (("<>=").indexOf(token.value.substr(0, 1)) !== -1) {
        token.subtype = TOK_SUBTYPE_LOGICAL.toString();
      } else if (token.value.toString() === "&") {
        token.subtype = TOK_SUBTYPE_CONCAT.toString();
      } else {
        token.subtype = TOK_SUBTYPE_MATH.toString();
      }
      continue;
    }

    if ((token.type.toString() === TOK_TYPE_OPERAND) && (token.subtype.length === 0)) {
      if (isNaN(parseFloat(token.value))) {
        if ((token.value.toString() === 'TRUE') || (token.value.toString() === 'FALSE')) {
          token.subtype = TOK_SUBTYPE_LOGICAL.toString();
        } else {
          token.subtype = TOK_SUBTYPE_RANGE.toString();
        }
      } else {
        token.subtype = TOK_SUBTYPE_NUMBER.toString();
      }

      continue;
    }

    if (token.type.toString() === TOK_TYPE_FUNCTION) {
      if (token.value.substr(0, 1) === "@") {
        token.value = token.value.substr(1).toString();
      }
      continue;
    }

  }

  tokens2.reset();

  // move all tokens to a new collection, excluding all noops
  tokens = new F_tokens();

  while (tokens2.moveNext()) {
    if (tokens2.current().type.toString() !== TOK_TYPE_NOOP) {
      tokens.addRef(tokens2.current());
    }
  }

  tokens.reset();

  return tokens;
}

module.exports = {
  getTokens: getTokens
};

