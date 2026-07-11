setcpm(104/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)

$: s("gm_pad_warm").slow(2).clip(1).gain(.35)

$: note("c2*4 a4@2 c#5 a4@2").s("sawtooth").lpf(1500).gain(.4)
