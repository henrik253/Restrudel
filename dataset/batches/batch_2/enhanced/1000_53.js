setcpm(96/4)

$: s("sd bd ~ bd").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("a5 g5 f5 c5").sound("square").lpf(sine.range(800,2400).slow(4)).room(.2236).gain(.3)

$: note("<a2 f2>").sound("sawtooth").slow(2).lpf(600).release(.2).gain(.4)
