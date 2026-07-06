setcpm(120/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh oh hh oh").gain(.2)

$: note("d4 b3 g3 a4").s("sawtooth").lpf(4000)
  .speed("<1 2>").release(.2).gain(.4)

$: note("d2 g1 d2 a1").s("square").lpf(700)
  .release(.25).gain(.45)
