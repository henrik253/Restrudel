setcpm(100)

$: s("woodblock:1 woodblock:2*2").slow(2.5409).gain(.5)

$: s("gm_acoustic_guitar_steel:2 gm_synth_strings_1").bank("RolandTR909").gain(.732).fast(1.2).lpf(1500).gain(.4)

$: note("a4 d#5@6").sound("drums kick").lpf(3200).hpf(188).room(.5).gain("[1 0.5]*4").bank("RolandTR909")
