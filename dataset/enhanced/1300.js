setcpm(120/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("b2 d#3 c#3 g#2").s("sawtooth")
  .lpf(1000).release(.25).gain(.4)

$: note("<b4 d#5 c#5 g#4>").s("triangle")
  .lpf(2600).room(.4).delay(.4).gain(.3)
