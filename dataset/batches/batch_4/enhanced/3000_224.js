setcpm(100)

$: s("lt cr").slow(2).gain(.5)

$: s("hh*8").gain(.2)

$: note("c2 a2").sound("drums snare").lpf(3000).velocity(.5).gain(.5).release(6).attack(.1).clip(1.2).bank("RolandTR909")
