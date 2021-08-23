#!/usr/bin/env bash

# change dir to this script's location
cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ ! -e "stops-downloaded.csv" ]]; then
  echo "could not find 'stops-downloaded.csv'"
  exit 1
fi

read -p "this script will overwrite 'stops.csv' and\
 fill it with all valid stops found in\
 'stops-downloaded.csv'. Continue? (y/n) " -n 1 -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 2
fi

echo ""
echo "" >stops.csv
totalLines="$(cat "stops-downloaded.csv" | wc -l)"
i=0
while IFS="" read -r l || [ -n "$l" ]; do
  stopId="$(echo "$l" | cut -f2 -d';')"
  if [[ "$(curl "https://iris.noncd.db.de/iris-tts/timetable/station/$stopId"\
   2>/dev/null | grep -oP '<station[^s]')" != "" ]]; then
    prog="$(echo "100.0 * $i / $totalLines" | bc -l)"
    printf "[%6d/%6d, %5.1f%%] valid: %-7s (full line: '%s')\n" "$i" "$totalLines" "$prog" "$stopId" "$l"
    echo $l >>stops.csv
    sleep "$(expr $RANDOM / 30000).$(expr $RANDOM + $RANDOM + $RANDOM)"
  fi
  i="$(expr $i + 1)"
done < "stops-downloaded.csv"
