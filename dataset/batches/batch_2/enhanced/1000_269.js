setcpm(110/4)
$: s("bd ~ ~ sd").bank("RolandTR808").gain(.8)
$: s("gm_acoustic_guitar_steel:2").gain(.6).note("c2 a2 eb2 c2")
$: n("7 3").scale("g4:dorian").struct("x*3").s("sawtooth").lpf(1800).release(.1).gain(.4)
