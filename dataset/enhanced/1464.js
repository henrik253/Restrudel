setcpm(120/4)

$: s("bd ~ sd ~ ~ bd sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: s("~ ~ ~ crash").bank("RolandTR909").gain(.3).room(.5)

$: note("f4 ~ d#4 d#4 c4 g#4 ~ g4 ~ f#4 f4 d#4 c#4 a#3 ~ e4")
  .s("gm_lead_1_square").lpf(2500).resonance(4).release(.15).delay(.4).gain(.4)

$: n("G3 Bb3 F4 ~ G3 Bb3 E4 G3 Bb3 E4 ~ Bb3 D3 F4 Bb3 D3")
  .s("gm_electric_bass_finger").lpf(600).room(.3).release(.2).gain(.5)
