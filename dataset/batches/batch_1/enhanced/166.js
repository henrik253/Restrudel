setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~").release(.12).gain(.5)

$: s("~ oh ~ oh").bank("RolandTR909").gain(.3)

$: n("0 3 5 7 5 3").scale("c:minor").s("sawtooth")
  .lpf(2200).release(.2).room(.3).gain(.4)

$: n("<c2 g1 g#1 bb1>").scale("c:minor").s("square")
  .lpf(600).release(.25).gain(.5)
