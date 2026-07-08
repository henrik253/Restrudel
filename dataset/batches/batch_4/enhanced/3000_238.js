setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("a2 f2 c3 g2 f2 a2 c3 f3 a3 c4 f4 c4 e4").lpf(1500).gain(.4)

$: s("gm_acoustic_guitar_steel:2 gm_electric_bass_finger").gain(.15).hpf(8000).lpf(1500).gain(.4)
