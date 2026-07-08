setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.16)

$: note("b4@2 b4 b4 b4 b4@2 f4@2 ~ b4").s("sine")
  .lpf(2500).room(.9).release(.2).gain(.4)

$: n("1 -4 -1 -1 -5 -3 -3 -3").scale("a:minor").s("sawtooth")
  .transpose(1).lpf(2000).release(.2).gain(.35)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("gm_cello")
  .release(.3).gain(.4)
