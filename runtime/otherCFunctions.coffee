
strcmp = (str1, str2) ->
  if str1 == str2 then 0 else if str1 > str2 then 1 else -1


doubleToReasonableString = (d) ->

  # when generating code, print out
  # the standard JS Number printout
  if codeGen
    return d + ""

  # remove trailing zeroes beyond decimal point and
  # gives at most 6 digits after the point
  # see "Remove insignificant trailing zeros from a number?"
  # here: https://stackoverflow.com/a/19623253
  stringRepresentation = "" + parseFloat(d.toFixed(6))

  # we actually want to give a hint to user that
  # it's a double, so add a trailing ".0" if there
  # is no decimal point
  if stringRepresentation.indexOf(".") == -1 
    stringRepresentation += ".0"

  return stringRepresentation

# does nothing
clear_term = ->

# s is a string here anyways
isspace = (s) ->
  if !s? then return false
  return s == ' ' or s == '\t' or s == '\n' or s == '\v' or s == '\f' or s == '\r'

isdigit = (str) ->
  if !str? then return false
  return /^\d+$/.test(str)

isalpha = (str) ->
  if !str? then return false
  #Check for non-alphabetic characters and space
  return (str.search(/[^A-Za-z]/) == -1)

isalphaOrUnderscore = (str) ->
  if !str? then return false
  #Check for non-alphabetic characters and space
  return (str.search(/[^A-Za-z_]/) == -1)

isunderscore = (str) ->
  if !str? then return false
  return (str.search(/_/) == -1)

isalnumorunderscore = (str) ->
  if !str? then return false
  return (isalphaOrUnderscore(str) or isdigit(str))
