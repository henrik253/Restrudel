setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.16)

$: note("a1 f1 c2 g1").s("sawtooth")
  .clip(1).release(.25).lpf(700).gain(.5)

$: note("~ f#2 ~ f6 d6 b5 ~ f6").s("square")
  .lpf(2200).release(.2).room(.3).gain(.35)
