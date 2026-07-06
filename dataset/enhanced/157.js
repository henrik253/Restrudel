setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("noise*4").hpf(4000).gain("[.25 .1]*4")

$: n("0 3 5 7").scale("c:major").s("gm_bassoon")
  .release(.3).room(.3).gain(.4)

$: n("<c2 g1 a1 f1>").scale("c:major").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
