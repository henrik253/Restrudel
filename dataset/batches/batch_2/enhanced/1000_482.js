setcpm(130/4)
$: s("clave ~ clave ~").lpf(4000).room(.5).release(.2).gain(.4)
$: n("9 10 8 13 9 8 6 ~ 8 6 8 9").scale("c:minor").s("sawtooth").gain(.3).release(.08).attack(.001)
$: s("bd sd*2").bank("RolandTR909").slow(2).gain(.8)
