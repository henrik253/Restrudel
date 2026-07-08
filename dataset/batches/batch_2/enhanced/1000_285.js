setcpm(96/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)
$: s("gm_oboe gm_tenor_sax:1").speed("<1 2 0.5>").hpf(80).room(.6).gain(.4)
$: note("C3 Eb3 G2 Bb2 Eb2 F#2 B2 F#2").sound("triangle").lpf(1474).gain(.35)
