cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null \
  && npm install turbocommons-es5 \
  && echo "" \
  && echo "extracting js file..." \
  && cp node_modules/turbocommons-es5/turbocommons-es5.js . \
  && echo "done."
