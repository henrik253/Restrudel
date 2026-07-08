setcpm(90/4)
$: note("b1 d2").transpose(1).velocity(.5).s("sawtooth").gain(.4)
$: s("recorder_bass_sus").note("b3 d3").gain(.5)
$: s("bd ~ sd ~").bank("RolandTR808").room(.5).gain(.7)
