setcpm(100/4)
$: s("bd ~ sd ~ hh ht").gain(.75).shape(.2).release(.15).attack(.02)
$: sound("hh ~").lpf(2600).room(.6).gain(.2)
$: note("c2 a2 eb2").sound("sawtooth").lpf(500).gain(.4)
