setcpm(120/4)

$: s("bd ~ rim ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.18)

$: note("a3 c#4 e4 a4 f3 a3 c4 f4").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: n("<9 8>*2 ~").scale("g:minor").s("gm_lead_6_voice")
  .release(.3).delay(.3).gain(.35)

$: note("<a1 a1 f1 f1>").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
