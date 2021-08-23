Abfahrtstafelsuche
==================

Simpler Helfer um die Abfahrts- und Ankunfttafeln der Deutschen Bahn zu finden. Die Suche ist unter [bruellware.github.io](https://bruellware.github.io) veroeffentlicht.

Eine Beispieltafel ist unter [iris.noncd.db.de/wbt/js/index.html?bhf=AA](https://iris.noncd.db.de/wbt/js/index.html?bhf=AA) zu finden. Der `bhf` get-Parameter gibt die gewuenschte Station an. Stationskuerzel und volle Namen koennen hier gefunden werden: [data.deutschebahn.com/dataset/data-betriebsstellen.html](https://data.deutschebahn.com/dataset/data-betriebsstellen.html).

Der Stand von 07/2021 ist in diesem Repository als `stops-downloaded.csv` hinterlegt. Das bash-Skript `check-stops.sh` geht die Datei `stops-downloaded.csv` Zeile fuer Zeile durch und prueft ob die Betriebsstellen-ID eine gueltige Haltetafel hat. Alle gueltigen Betriebsstellen-IDs werden nach `stops.csv` geschrieben, welche vom Frontend zur Stationsnamenssuche verwendet wird.
