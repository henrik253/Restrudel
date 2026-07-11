setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").hpf(500).gain(.2).pan(.7)

$: note("b2 f#2").s("sawtooth")
  .lpf(1400).room(.5).delay(.2).release(.2).gain(.45)

$: note("<b1 f#1 g1 c#2>").s("square")
  .lpf(600).release(.3).gain(.5)
