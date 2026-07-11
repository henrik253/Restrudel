setcpm(100/4)

$: s("sd mt@57").cutoff(857).gain(.3678)

$: s("lead gm_tuba").struct("~ x*2").add("0,.02").gain(0.4)

$: s("gm_epiano1:1 saw bd*2 sd bd*2 sd").clip(1).gain(0.5)

$: s("recorder_bass_sus hh*2").slow(2.7665).gain(0.6000000000000001)
