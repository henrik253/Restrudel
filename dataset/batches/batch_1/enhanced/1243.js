setcpm(116/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.5)

$: note("a1 f1 c2 g1 bb1 c2").s("sawtooth")
  .lpf(700).release(.2).gain(.5)

$: note("c#4 d#4 f4 d#4").s("gm_tuba")
  .struct("x*6").lpf(1500).release(.15).gain(.35)

$: note("e5 c#5 ~ a5").s("triangle")
  .lpf(2500).room(.7).delay(.2).release(.3).gain(.3)
