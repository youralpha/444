<script lang="ts">
  import { Link } from "svelte-routing";
</script>

<aside class="w-64 bg-tactical-800 border-r border-tactical-700 flex flex-col h-screen shrink-0">
  <div class="p-6 border-b border-tactical-700">
    <h1 class="text-2xl font-bold font-mono tracking-widest text-tactical-accent uppercase">PERIMETR</h1>
    <p class="text-xs text-gray-400 mt-1 uppercase tracking-wider">Tactical OS (Svelte)</p>
  </div>

  <nav class="flex-1 p-4 space-y-3 overflow-y-auto">
    <Link to="/">
      <button class="w-full flex items-center gap-4 p-4 text-left transition-all font-mono text-sm tracking-widest uppercase rounded-sm group text-gray-400 hover:bg-tactical-900/50 hover:text-white border-l-2 border-transparent hover:border-tactical-accent">
        <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        ДАШБОРД
      </button>
    </Link>

    <Link to="/kpt">
      <button class="w-full flex items-center gap-4 p-4 text-left transition-all font-mono text-sm tracking-widest uppercase rounded-sm group text-gray-400 hover:bg-tactical-900/50 hover:text-white border-l-2 border-transparent hover:border-tactical-accent">
        <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        КПТ ПРОТОКОЛ
      </button>
    </Link>

    <Link to="/base">
      <button class="w-full flex items-center gap-4 p-4 text-left transition-all font-mono text-sm tracking-widest uppercase rounded-sm group text-gray-400 hover:bg-tactical-900/50 hover:text-white border-l-2 border-transparent hover:border-tactical-accent">
        <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        BASE ТАЙМЕР
      </button>
    </Link>

    <Link to="/knowledge">
      <button class="w-full flex items-center gap-4 p-4 text-left transition-all font-mono text-sm tracking-widest uppercase rounded-sm mt-6 border-t border-tactical-700 pt-6 group text-gray-400 hover:bg-tactical-900/50 hover:text-white border-l-2 border-transparent hover:border-tactical-accent">
        <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
        БАЗА ЗНАНИЙ
      </button>
    </Link>
  </nav>

  <div class="p-4 border-t border-tactical-700 flex items-center gap-2">
    <div class="w-2 h-2 rounded-full bg-tactical-accent animate-pulse"></div>
    <span class="text-xs text-gray-400 uppercase tracking-widest font-mono">System Online</span>
  </div>
</aside>

<style>
  /* Ensure Links don't break layout */
  :global(a) { text-decoration: none; display: block; }
</style>
