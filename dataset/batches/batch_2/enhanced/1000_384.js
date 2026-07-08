setcpm(115/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: s("gm_electric_bass_finger:2").fast(2).gain(.4)
$: note("a#5 g#5 e5 c#5 ~ f5 f#5 e5 ~ e5 d#5 a#4").sound("sawtooth").transpose("<0 2 [3 1]>/8").lpf(1200).gain(.35)
