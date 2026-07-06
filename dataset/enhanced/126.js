setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ rd ~ rd").bank("RolandTR909").gain(.35)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("~ g#4 a#4 b4 d#5 ~ f#5 a#4").s("sawtooth")
  .clip(1).lpf(2500).resonance(6).release(.2).delay(.3).room(.4).gain(.4)

$: note("c4 c4 e4 g4").s("square").lpf(2500).release(.2).room(.5).gain(.35)
