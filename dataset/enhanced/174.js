setcpm(120/4)

$: s("amen*2").pan(.55).gain(.6)

$: s("linndrum_bd ~ rim ~").bank("AkaiLinn").gain(.7)

$: note("e5 c#5 ~ f#5 e5 ~ e5 d#5").s("sawtooth")
  .lpf(2600).room(.4).release(.25).gain(.4)

$: note("<a2 a1 e2 f2>").s("square")
  .lpf(600).release(.25).gain(.5)
