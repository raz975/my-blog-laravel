<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;

    public function __construct($userName)
    {
        $this->userName = $userName;
    }

    public function build()
    {
        return $this->subject('Добро пожаловать в наш Блог!')
                    ->html("
                        <div style='font-family: Arial, sans-serif; padding: 20px;'>
                            <h2 style='color: #3b82f6;'>Привет, {$this->userName}!</h2>
                            <p>Спасибо за регистрацию на нашем сайте.</p>
                            <p>Теперь вы можете создавать посты, ставить лайки и оставлять комментарии.</p>
                            <br>
                            <p style='color: #888; font-size: 12px;'>Это письмо отправлено автоматически.</p>
                        </div>
                    ");
    }
}