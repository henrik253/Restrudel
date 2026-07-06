setcpm(112/4)

$: s("bd ~ lt ~ ~ mt sd ~").bank("RolandTR808").gain(.8)

$: s("hh*2 hh hh*2 hh").gain(.2)

$: note("<g5 e5 d5 e5>").s("triangle")
  .lpf(2500).release(.2).room(.3).delay(.3).gain(.35)

$: n("<c2 c2 a1 g1>").scale("c:major").s("gm_cello")
  .lpf(700).release(.3).gain(.4)
