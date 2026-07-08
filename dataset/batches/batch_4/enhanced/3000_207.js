setcpm(100)

$: s("linndrum_bd cajon").gain(.5).bank("RolandTR909")

$: n("~ Ab3 C4 Eb4 Ab3 C4").clip(.9).release(.5).lpf(1500).gain(.4)

$: s("hh*4 ~").velocity(.65).slow(2).gain(.2)
