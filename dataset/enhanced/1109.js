setcpm(104/4)

$: s("bd*2 ~ sd ~").bank("RolandTR808").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("c1 f1 c1 g1").s("sawtooth")
  .lpf("<1500 1800 2400>").release(.2).gain(.5)

$: note("c5 g4 c5 g4").s("square").room(.6)
  .release(.3).gain(.4)
