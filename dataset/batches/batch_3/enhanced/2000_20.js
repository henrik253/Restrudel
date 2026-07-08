setcpm(30)

$: s("bd*2 ~").gain(.7).release(.1)

$: s("hh*8").gain(.2).release(.05)

$: n("0 3 5 3").scale("G4 minor").s("sawtooth").lpf(1200).gain(.4).release(.2)

$: n("0 2 4 7").s("square").lpf(2000).gain(.3).release(.3)
