setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .12]*4")

$: note("a2*8").s("sawtooth")
  .lpf(1500).room(.4).release(.12).gain(.5)

$: n("0 3 7 5").scale("a:minor").s("square")
  .lpf(2200).release(.2).gain(.35)
