setcpm(124/4)

$: s("bd*4").bank("AkaiLinn").gain(.85)

$: s("hh*4 ~ sd sd").gain(.2).pan(.4)

$: n("0 3 7 5 7 3 0 ~").scale("c:minor").s("gm_lead_1_square")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<c2 c2 g1 ab1>").scale("c:minor").s("gm_bassoon")
  .lpf(700).release(.2).gain(.5)
