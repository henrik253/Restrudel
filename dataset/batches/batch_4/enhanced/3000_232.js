setcpm(100)

$: n("F4 A3 Gb4 Bb3 E4 G4 ~ F3 A3 C3 F3 A3 C3 ~ F3 A3 C3").scale("c3:minor").velocity("<.9@28 1.2@2>").lpf(1500).gain(.4)

$: s("hh*8").gain(.2)

$: s("kick 1").lpf(650).room(.3).gain(.1841).release(.1).attack(.08).bank("RolandTR909")
