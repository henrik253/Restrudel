setcpm(90/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)
$: note("d#5@2 ~ a4 d#5 ~ a4 d#5 d5 c#5 d5").sound("sawtooth").lpf(2000).resonance(4).gain(.4)
$: note("f4 ~ f4 ~").s("sawtooth square").gain("[1 0.7 1 0.5]*2").release(1.2).lpf(900)
