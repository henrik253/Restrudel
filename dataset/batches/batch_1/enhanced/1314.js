setcpm(116/4)

$: s("bd ~ bd ~").bank("RolandTR909").lpf(2000).gain(.8)

$: s("~ brakedrum:1 ~ brakedrum:1").gain(.3)

$: n("0 3 7 5").scale("a:minor").s("gm_bassoon")
  .lpf(2200).release(.3).gain(.35)

$: n("<a1 e2 f1 c2>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
