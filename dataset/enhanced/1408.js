setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("b2 f#2 f2 bb2 eb2 bb3 c#2 f#2").s("triangle")
  .lpf(1300).release(.3).room(.5).delay(.4).gain(.4)

$: note("<b1 b1 f#1 eb1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
