setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ ~ hh:8").gain(.2)

$: note("e5 c#4 e5 d#5 a#4 d#4 e4 b4").s("sawtooth")
  .lpf(2500).release(.2).room(.3).gain(.4)

$: n("<0 3 5 7>").scale("c#:minor").s("gm_distortion_guitar")
  .lpf(1800).release(.2).gain(.35)

$: n("<c#2 g#1 a1 b1>").scale("c#:minor").s("square")
  .lpf(600).release(.25).gain(.5)
