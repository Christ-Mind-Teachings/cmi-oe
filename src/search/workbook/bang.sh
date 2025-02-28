#!/bin/bash

bin="../_bin/bin"
rm *.bang

for i in `cat contents`; do
  ${bin}/prep -a -b workbook $i
done

