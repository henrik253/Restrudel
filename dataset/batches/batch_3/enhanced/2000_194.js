setcpm(110)

$: s("saw 1").gain(.85)
$: s("gm_synth_strings_1 gm_electric_bass_finger:2").gain(.3).room(.6968).delay(.5).degradeBy(.4207)
$: note("b@2 f@2").velocity(.55).hpf(6178).room(.7).gain(.6).lpf(1764)
$: s("bd*2 ~ ~ sd").clip(2).gain("[0.8 0.9 0.7 0.9]*2")
