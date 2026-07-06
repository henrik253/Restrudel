setcpm(128/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[.2 .13]*8").hpf(800)

$: note("a#5 g#5 e5 c#5 f#5 e5 d#5 a#4").s("sawtooth")
  .lpf(2500).resonance(6).release(.15).delay(.3).room(.3).gain(.4)

$: note("d2 d2 d2 d2").s("gm_electric_bass_finger").hpf(200).lpf(700).release(.2).gain(.5)

$: note("<d2 a1 f2 a1>").s("square").lpf(650).release(.25).gain(.4)
