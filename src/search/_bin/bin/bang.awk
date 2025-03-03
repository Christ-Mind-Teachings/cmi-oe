#
# if we find the regex then we keep the one line paragraph
# - indicated this by returning 0
#
# return 1 if we want to discard the paragraph
#
function discardParagraph(p) {
  # a reveiw lesson link
  if (n = match(p,/^\[\*/) > 0) {
    return 1
  }
  # no review lessn 'return to review' link
  if (n = match(p,/^<a/) > 0) {
    return 1
  }
  if (n = match(p,/and/i) > 0) {
    return 1
  }
  if (n = match(p,/for example/i) > 0) {
    return 1
  }
  if (n = match(p,/on the hour/i) > 0) {
    return 1
  }
  if (n = match(p,/on the half hour/i) > 0) {
    return 1
  }
  if (n = match(p,/for morning and evening review/i) > 0) {
    return 1
  }
  return 0
}

#
# Return OE paragraph number from paragraph. The number is assigned
# by CIMS and is enclosed by <sup>###</sup>
#
# Paragraphs without <sup>###</sup> are paragraph 1
#
function extractParaNum(p) {
  if (n = match(p,/<sup>([0-9]+)/, a) == 0) {
    return "1"
  }

  return substr(p, a[1,"start"], a[1,"length"])
}


BEGIN {
  i = 0
  p = 0
  l = -1
  omit = 0
  fm = 0
  inp = false
  needComma = "n"
  bangfound = 1

  #printf "\"source\": \"%s\",  \"book\": \"%s\", \"unit\": \"%s\",\n", source, book, unit
  header = sprintf("source: %s, book: %s, unit: %s\n", source, book, unit)
  # printf "  \"paragraph\": [\n"
}
/---/ {
  if (fm == 0) {
    fm = 1
  }
  else if (fm == 1) {
    fm = 2
  }
  next
}
/Track/ {
  getline tmp
  next
}
$1 ~ /##/ {
  # questions
  next
}
# a markdown class designation
/^{:/ {
  omit = 1
  next
}
/^<div/ || /^<\/div/ {
  # found in acim study group transcripts
  next
}
/^\[\^/ {
  # a footnote reference
  next
}
/^$/ || /^>$/ || /^>\s*$/ {

  # discard paragraphs when omit is true
  if (omit == 1) {
    l = -1
    text = ""
    delete lines
    p++
    omit = 0
    next
  }

  if (l > -1) {
    len = length(lines)
    discard = 0
    if (len == 1) {
      discard = discardParagraph(lines[0])
    }
    ref = extractParaNum(lines[0])

    # printf "  %s{\n", needComma == "y" ? "," : ""
    # printf "    \"discard\": %u,\n", discard
    # printf "    \"pid\": %s,\n", p
    # printf "    \"ref\": %s,\n", ref

    for (line in lines) {
      raw = lines[line]
      # remove html elements
      gsub(/\&hellip;/, "", raw)
      gsub(/ \&ndash; /, "", raw)
      gsub(/\&ndash;/, " ", raw)
      gsub(/ \&mdash; /, "", raw)
      gsub(/\&mdash;/, " ", raw)
      gsub(/\&ldquo;/, "", raw)
      gsub(/\&rdquo;/, "", raw)
      gsub(/\&lsquo;/, "", raw)
      gsub(/\&rsquo;/, "", raw)
      # remove <sup>.*</sup>
      gsub(/<sup>[0-9]+<\/sup> /, "", raw)
      # remove <br/> 
      gsub(/<br\/>/," ",raw)
      # remove <p></p> 
      gsub(/<\/?p[^>]*>/,"",raw)
      # remove <span></span> 
      gsub(/<\/?span[^>]*>/,"",raw)
      # remove punctuation
      gsub(/[\[\])(*>.,?;:’'"“”~/\\]/,"",raw)
      #remove 0xa0
      gsub(/ /,"",raw)
      # convert dash to space 
      gsub(/[-—]/," ",raw)
      text = sprintf("%s %s", text, raw)
    }
    # remove \%u200a
    gsub(/ /, "", text)
    # remove \%u2013
    gsub(/–/, "", text)
    # remove leading space
    gsub(/^ */, "", text)
    # remove leading numbers
    gsub(/^[0-9]*/, "", text)
    # collapse two spaces into one
    gsub(/  */," ",text)
    # remove underscores - text bracketed by __xxx__ are bolded by markdown
    gsub(/__/,"",text)

    # print only paragraphs containing '!'
    if (n = match(text,/!/) > 0) {
      if (bangfound == 1) {
        printf header
        bangfound = 0
      }
      printf "pid: %s, text: %s\n", p, tolower(text)
    }
    # printf "    \"text\": \"%s\"\n  }\n", tolower(text)

    l = -1
    text = ""
    delete lines
    needComma = "y"
    p++
  }
  next
}
{
  # only interested in lines after front matter (fm) removed
  # - that's when fm=2
  if (fm == 2) {
    l++
    lines[l] = $0
  }
}
END {
  printf "\n"
}

