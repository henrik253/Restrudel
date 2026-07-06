setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~ hh*2 ~").gain(.2)

$: note("c4 a3 f3").s("sawtooth")
  .lpf(2800).release(.2).gain(.4)

$: note("~ c#5@2 g#4").s("square")
  .lpf(4000).hpf(400).release(.2).room(.4).gain(.3)
