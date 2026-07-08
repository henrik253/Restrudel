setcpm(30)

$: s("sd ~ sd ~").gain(.6).release(.1)

$: n("0 3 5 3").s("sawtooth").lpf(1200).gain(.4).release(.2)

$: n("0 2 4 7").s("square").lpf(2000).gain(.3).release(.3)
